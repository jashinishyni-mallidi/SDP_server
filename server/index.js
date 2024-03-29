const express = require("express");
const cors = require("cors");
const app = express();
const path = require('path'); 
const db = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const sendMailUtil = require('./utils/sendMailUtil'); // Renamed import
const multer = require('multer');
const csv = require('csvtojson');
const studentmodel = require('./models/student');
const sendotp = require('./utils/sendotp');
const useotp = require('./models/userotp'); // Import useotp model
const genotp = require('./utils/generateotp');
const user = require('./models/User');

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());

// Connection with DB
db.once('open', () => {
    console.log('Database connection is open.');
});

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);

// Handle sending OTP
app.post('/api/sendotp', async (req, res) => {
    const { semail } = req.body;
    const aotp = genotp();
    try {
        await useotp.create({ email: semail, otp: aotp, createdAt: Date.now() });
        const sent_to = semail;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = semail;
        const rotp = aotp;
        await sendotp(rotp, sent_to, sent_from, reply_to);
        res.status(200).json({ success: true, message: "OTP Email sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Handle OTP verification
app.post('/api/verifyotp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await useotp.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const storedOtp = user.otp;

        if (otp === storedOtp) {
            // OTP is correct
            await useotp.deleteOne({ email });
            return res.status(200).json({ success: true, message: "OTP verification successful" });
        } else {
            // Incorrect OTP
            return res.status(400).json({ error: "Incorrect OTP" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//To store files in uploads directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage,
});

// Route for uploading CSV file
app.post('/uploadcsv', upload.single("csvFile"), async (req, res) => {
    try {
        const up = await csv().fromFile(req.file.path);
        await studentmodel.insertMany(up);
        console.log("Added to Database");
        return res.send("Added to Database Successfully");
    } catch (error) {
        console.error("Error adding data:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post('/api/sendMail', async (req, res) => {
    const { email, message, subject } = req.body;

    try {
        const sent_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const mailsubject = subject;

        const textMessage = message;
        await sendMailUtil(mailsubject, textMessage, sent_to, sent_from, reply_to);
        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (err) {
        res.status(500).json(err.message);
    }
});

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3500, () => {
    console.log("KLU Server is Launch...");
});
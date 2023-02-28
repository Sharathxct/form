const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config()

const app = express();
const port = 3000;

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/' });
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
const db = mongoose.connection;
const formSchema = new mongoose.Schema({
  studentName: String,
  email: String,
  collegeName: String,
  year: String,
  department: String,
  section: String,
  rollNumber: String,
  phoneNumber: String,
  events: [String],
  paymentScreenshot: String,
  Transactionid:String
});

const Form = mongoose.model('Form', formSchema);

app.get("/",(req,res)=>{
    res.render("index");
})
app.post('/submit', upload.single('paymentScreenshot'),async (req, res) => {
  const { studentName, email, collegeName, year, department, section, rollNumber, phoneNumber,Transactionid } = req.body;
   const events = req.body.events;
   const result = await cloudinary.uploader.upload(req.file.path); 
  const paymentScreenshot = result.secure_url;

  const formData = new Form({
    studentName,
    email,
    collegeName,
    year,
    department,
    section,
    rollNumber,
    phoneNumber,
    events,
    Transactionid,
    paymentScreenshot
  });

  formData.save()
    .then(() => {
      res.status(200).send('Registered successfully');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error submitting form data');
    });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

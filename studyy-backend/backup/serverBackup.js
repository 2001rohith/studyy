const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const PORT = 8000;

//MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 4000000 },
}));
app.use(passport.initialize());
app.use(cookieParser());
require("./config/passport");

//routes
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
app.use("/user", userRoutes);
app.use("/course", courseRoutes);

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
});

const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const classes = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('error', (err) => console.error(`Socket error for ${socket.id}:`, err));

    socket.on('join-class', ({ classId, role }) => {
        console.log(`${role} joined class: ${classId}`);
        if (!classes[classId]) {
            classes[classId] = { teacher: null, students: [], offer: null };
        }

        if (role === 'Teacher') {
            classes[classId].teacher = socket.id;
            console.log(`Teacher ID: ${socket.id}`);
        } else if (role === 'Student') {
            const students = classes[classId].students;

            if (!students.includes(socket.id)) {
                students.push(socket.id);
            } else {
                console.log(`Student ${socket.id} is already in class ${classId}`);
            }

            const offer = classes[classId]?.offer;
            if (offer) {
                console.log(`Sending stored offer to student ${socket.id}`);
                io.to(socket.id).emit('teacher-offer', { offer });
            }
        }

        socket.join(classId);
    });

    socket.on('teacher-offer', ({ classId, offer }) => {
        console.log(`Received offer from teacher for class ${classId}`);

        if (!classes[classId]) {
            classes[classId] = { teacher: socket.id, students: [], offer: null };
        }

        classes[classId].offer = offer;

        console.log(`Stored offer for class ${classId}:`, offer);

        classes[classId].students.forEach((studentId) => {
            io.to(studentId).emit('teacher-offer', { offer });
            console.log(`Sent offer to student ${studentId}`);
        });
    });

    socket.on('teacher-ice-candidate', ({ classId, candidate }) => {
        console.log(`Received ICE candidate from teacher for class ${classId}`);
        if (classes[classId]) {
            const uniqueCandidates = new Set(classes[classId].iceCandidates || []);
            uniqueCandidates.add(candidate);
            classes[classId].iceCandidates = Array.from(uniqueCandidates);

            classes[classId].students.forEach((studentId) => {
                io.to(studentId).emit('teacher-ice-candidate', { candidate });
                console.log(`Sent ICE candidate to student ${studentId}`);
            });
        }
    });

    socket.on('student-ice-candidate', ({ classId, candidate }) => {
        console.log(`Received ICE candidate from student for class ${classId}`);
        if (classes[classId] && classes[classId].teacher) {
            io.to(classes[classId].teacher).emit('student-ice-candidate', { candidate });
            console.log(`Sent ICE candidate to teacher ${classes[classId].teacher}`);
        }
    });

    socket.on('send-message', ({ classId, message }) => {
        console.log(`Message in class ${classId}:`, message);
        io.to(classId).emit('receive-message', message);
    });

    socket.on('end-class', ({ classId }) => {
        console.log(`Class ${classId} ended by teacher`);
        if (classes[classId]) {
            io.to(classId).emit('class-ended');
            delete classes[classId];
        } else {
            console.warn(`Attempted to end non-existent class ${classId}`);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id}. Reason: ${reason}`);
        Object.keys(classes).forEach((classId) => {
            if (classes[classId].teacher === socket.id) {
                console.log(`Teacher disconnected. Ending class ${classId}`);
                classes[classId].students.forEach((studentId) => {
                    io.to(studentId).emit('class-ended');
                });
                delete classes[classId];
            } else {
                const studentIndex = classes[classId].students.indexOf(socket.id);
                if (studentIndex !== -1) {
                    console.log(`Removing student ${socket.id} from class ${classId}`);
                    classes[classId].students.splice(studentIndex, 1);
                }
                if (classes[classId].students.length === 0 && !classes[classId].teacher) {
                    console.log(`Class ${classId} is empty. Cleaning up.`);
                    delete classes[classId];
                }
            }
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


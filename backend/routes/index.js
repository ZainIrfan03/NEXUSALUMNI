const activityRoutes = require("./activityRoutes");
const alumniDashboardRoutes = require("./alumniDashboardRoutes");
const alumniDirectoryRoutes = require("./alumniDirectoryRoutes");
const alumniJobRoutes = require("./alumniJobRoutes");
const alumniMentorshipRoutes = require("./alumniMentorshipRoutes");
const alumniProfileRoutes = require("./alumniProfileRoutes");
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const directoryRoutes = require("./directoryRoutes");
const jobRoutes = require("./jobRoutes");
const mentorshipRoutes = require("./mentorshipRoutes");
const messageRoutes = require("./messageRoutes");
const storyRoutes = require("./storyRoutes");
const studentProfileRoutes = require("./studentProfileRoutes");
const uploadRoutes = require("./uploadRoutes");

const routeRegistry = [
  ["/uploads", uploadRoutes],
  ["/api/auth", authRoutes],
  ["/api/directory", directoryRoutes],
  ["/api/stories", storyRoutes],
  ["/api/mentorship", mentorshipRoutes],
  ["/api/jobs", jobRoutes],
  ["/api/student/profile", studentProfileRoutes],
  ["/api/student/dashboard", dashboardRoutes],
  ["/api/student/activity", activityRoutes],
  ["/api/alumni/profile", alumniProfileRoutes],
  ["/api/alumni/dashboard", alumniDashboardRoutes],
  ["/api/alumni/mentorship", alumniMentorshipRoutes],
  ["/api/alumni/jobs", alumniJobRoutes],
  ["/api/alumni/directory", alumniDirectoryRoutes],
  ["/api/messages", messageRoutes],
];

const registerRoutes = (app) => {
  routeRegistry.forEach(([path, router]) => app.use(path, router));
};

module.exports = registerRoutes;

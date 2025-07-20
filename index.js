const express = require("express");
const cors = require("cors");
const transporter = require("./utils/transporter");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 8000;
const siteName = process.env.SITE_NAME;
const mailSender = process.env.MAIL_SENDER;
const mailCc = process.env.MAIL_CC;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
	res.send("Hello");
});

app.post("/api/send-mail", (req, res) => {
	const { emails, message, subject } = req.body;

	if (!emails || !Array.isArray(emails) || emails.length <= 0) {
		return res
			.status(400)
			.json({ success: false, message: "Emails are required" });
	}

	if (!message || !subject || message.length <= 0 || subject.length <= 0) {
		return res.status(400).json({
			success: false,
			message: "Message and subject are required",
		});
	}

	const mailOptions = {
		from: `${siteName} <${mailSender}>`,
		to: emails.join(", "),
		cc: mailCc,
		subject: subject || siteName,
		html: message,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.status(500).json({
				success: false,
				message: "Error sending email(s)",
			});
		}

		res.status(200).json({
			success: true,
			messageId: info.messageId,
			message: "Mail(s) sent successfully!",
		});
	});
});

app.get("/api/test-mail", (req, res) => {
	const emails = [""];
	const cc = mailCc;
	const subject = "[TEST] Test Email from " + siteName;

	const message = `
        <html>
            <body>
                <h1 style="color: #333;">Hello!</h1>
                <p>This is a test email sent from the <strong>/api/test-mail</strong> endpoint.</p>
                <p>Thank you for using our service!</p>
            </body>
        </html>
    `;

	// http://localhost:8000/api/test-mail

	const mailOptions = {
		from: `${siteName} <${mailSender}>`,
		to: emails.join(", "),
		cc: cc,
		subject: subject,
		html: message,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
			return res.status(500).json({
				success: false,
				message: "Error sending test email",
			});
		}

		res.status(200).json({
			success: true,
			messageId: info.messageId,
			message: "Test email sent successfully!",
		});
	});
});

app.listen(PORT, () => {
	console.log(`Connected on port ${PORT}@http://localhost:${PORT}`);
});

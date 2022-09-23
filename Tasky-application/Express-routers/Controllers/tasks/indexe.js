import express from "express";
import authMiddleware from "../../middleware/auth/verifyToken.js";
import { scheduleJob, scheduledJobs, cancelJob } from "node-schedule";
import fs from "fs/promises";

import { randomString, sendEmail, sendSMS } from "../../utils/index.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
	try {
		const payload = req.payload;
		if (!payload) {
			return res.status(401).json({ error: "Unauthorised Access" });
		}

		let { task_name, deadline } = req.body;
		if (!task_name || !deadline) {
			return res.status(400).json({ error: "Some Fields are Missing" });
		}

		let utc_deadline = new Date(deadline);

		let present_time = new Date();

		if (utc_deadline == "Invalid Date" || utc_deadline < present_time) {
			return res.status(400).json({ error: "Invalid Date Entered" });
		}

		let difference = utc_deadline - present_time;

		let mins = difference / (1000 * 60);

		if (mins < 1 || days > 30) {
			return res
				.status(400)
				.json({
					error:
						"Invalid Date Entered, Deadline Should be More than 30 mins and Less than 30 Days",
				});
		}

		let reminders = [];

		let reminder1 = new Date(+present_time + difference / 4);

		let reminder2 = new Date(+present_time + difference / 2);

		let reminder3 = new Date(+present_time + difference / (4 / 3));

		reminders.push(reminder1, reminder2, reminder3, utc_deadline);
		console.log(reminders);

		let fileData = await fs.readFile("data.json");
		fileData = JSON.parse(fileData);

		let userFound = fileData.find((ele) => ele.user_id == payload.user_id);
		let task_id = randomString(14);
		let task_data = {
			task_id,
			task_name,
			deadline: utc_deadline,
			isCompleted: false,
			reminders,
		};

		task_data.reminders.forEach((ele, i) => {
			scheduleJob(`${task_id}_${i}`, ele, () => {
				sendEmail({
					subject: "This is a  Reminder",
					to: userFound.email,
					html: `<p>Hi ${userFound.firstname}, <br>
                    This is a Reminder - ${
											i + 1
										} to Complete your Task ${task_name} <br>
                    <b>CFI Tasky App</b>
                    </p>`,
				});

				console.log(new Date());
			});
		});
		console.log(scheduledJobs);

		console.log(userFound.tasks);
		userFound.tasks.push(task_data);

		await fs.writeFile("data.json", JSON.stringify(fileData));
		res.status(200).json({ success: "Task was Added" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


router.delete("/api/task/:task_id", async (req, res) => {
	try {
		let task_id = req.params.task_id;
		console.log(task_id);

		let token = req.headers["auth-token"];
		if (!token) {
			return res.status(401).json({ error: "Unauthorised Access" });
		}
		const payload = jwt.verify(token, "codeforindia");
		if (!payload) {
			return res.status(401).json({ error: "Unauthorised Access" });
		}

		let fileData = await fs.readFile("data.json");
		fileData = JSON.parse(fileData);

		let userFound = fileData.find((ele) => ele.user_id == payload.user_id);

		let taskIndex = userFound.Tasks.findIndex((ele) => ele.task_id == task_id);

		if (taskIndex == -1) {
			return res.status(404).json({ error: "Task Not Found" });
		}

		userFound.Tasks.splice(taskIndex, 1);

		await fs.writeFile("data.json", JSON.stringify(fileData));
		res.status(200).json({ success: "Task Was Deleted Successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});


router.put("/api/task/:task_id", async (req, res) => {
	try {
		let { new_task_name, new_deadline } = req.body;
		if (!new_task_name || !new_deadline) {
			return res.status(400).json({ error: "Some Fields are Missing" });
		}

		let task_id = req.params.task_id;

		let token = req.headers["auth-token"];
		if (!token) {
			return res.status(401).json({ error: "Unauthorised Access" });
		}
		const payload = jwt.verify(token, "codeforindia");

		if (!payload) {
			return res.status(401).json({ error: "Unauthorised Access" });
		}

		let fileData = await fs.readFile("data.json");
		fileData = JSON.parse(fileData);

		let userFound = fileData.find((ele) => ele.user_id == payload.user_id);

		let taskIndex = userFound.Tasks.find((ele) => ele.task_id == task_id);

		if (taskIndex == -1) {
			return res.status(404).json({ error: "Task Not Found" });
		}

		let utc_deadline = new Date(new_deadline);

		let present_time = new Date();

		if (utc_deadline == "Invalid Date" || utc_deadline < present_time) {
			return res.status(400).json({ error: "Invalid Date Entered" });
		}
		
		let difference = utc_deadline - present_time;

		let mins = difference / (1000 * 60);

		let days = difference / (1000 * 60 * 60 * 24);

		if (mins < 1 || days > 30) {
			return res.status(400).json({
				error:
					"Invalid Date Entered, Deadline Should be More than 30 mins and Less than 30 Days",
			});
		}

		let reminders = [];

		let reminder1 = new Date(+present_time + difference / 4);

		let reminder2 = new Date(+present_time + difference / 2);

		let reminder3 = new Date(+present_time + difference / (4 / 3));

		reminders.push(reminder1, reminder2, reminder3, utc_deadline);
		console.log(reminders);

		taskIndex.task_id = task_id;
		taskIndex.task_name = new_task_name;
		taskIndex.deadline = new_deadline;
		taskIndex.isCompleted = false;
		taskIndex.deadline = utc_deadline;
		taskIndex.reminders = reminders;

		taskIndex.reminders.forEach((ele, i) => {
			scheduleJob(`${task_id}_${i}`, ele, () => {
				sendEmail({
					subject: "This is a  Reminder",
					to: userFound.email,
					html: `<p>Hi ${userFound.firstname}, <br>
                    This is a Reminder - ${
											i + 1
										} to Complete your Task ${task_name} <br>
                    <b>CFI Tasky App</b>
                    </p>`,
				});

				console.log(new Date());
			});
		});

		await fs.writeFile("data.json", JSON.stringify(fileData));
		res.status(200).json({ success: "Task Was updated Successfully" });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});



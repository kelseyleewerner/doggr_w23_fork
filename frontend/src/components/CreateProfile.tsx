import React, {useState} from "react";
import {httpClient} from "../services/HttpService";

export enum SubmissionStatus {
	NotSubmitted,
	SubmitFailed,
	SubmitSucceeded
}

export const CreateProfile = () => {



	const [selectedFile, setSelectedFile] = useState();
	const [name, setName] = useState("");
	const [submitted, setSubmitted] = useState(SubmissionStatus.NotSubmitted);

	const onFileChange = event => {
		// Update the state
		setSelectedFile(event.target.files[0]);
	};

	const onUploadFile = (event) => {
		const formData = new FormData();
		// @ts-ignore
		formData.append('file', selectedFile);
		// @ts-ignore
		formData.append('fileName', selectedFile.name);
		formData.append('name', name);
		const config = {
			headers: {
				'content-type': 'multipart/form-data',
			},
		};
		httpClient.post("/profiles", formData, config)
			.then((response) => {
				console.log("Got response from upload file:", response.status);
				if (response.status === 200) {
					setSubmitted(SubmissionStatus.SubmitSucceeded);
				} else {
					setSubmitted(SubmissionStatus.SubmitFailed);
				}

			});
	};

	return (
		<div>
			<div className="doggrcenter doggr-section-text">Create profile</div>
			<div className={"form-control-sm max-w-2xs "}>
				{submitted === SubmissionStatus.SubmitFailed &&
					<h3>Creating Profile failed!</h3>
				}
				<div>
					<label className="label doggrFlexCenter" htmlFor="name">Name</label>
					<div className="doggrFlexCenter">
						<input
							className={"input input-bordered "}
							placeholder="Name..."
							type="text"
							id="name"
							required
							value={name}
							onChange={e => setName(e.target.value)}
							name="name"
						/>
					</div>
				</div>

				<div>
					<label
						className={"label doggrFlexCenter"}
						htmlFor="profilepic">Upload a profile picture (jpg/png):
					</label>
					<div className={"doggrFlexCenter"}>
						<input
							className= "doggrFileUpload"
							type="file"
							id="profilepic"
							name="profilepic"
							accept="image/png, image/jpeg"
							onChange={onFileChange}
						/>
					</div>
				</div>
				{ name != null && selectedFile != null &&


					<div className={"doggrFlexCenter"}>
						<button className="doggrbtn margin-top" onClick={onUploadFile}>Create</button>

					</div>
				}
			</div>
		</div>
	);
};

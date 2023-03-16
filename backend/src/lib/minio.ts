import "dotenv/config";
import {Client} from "minio";

export const minioClient = new Client({
	endPoint: "minio",
	port: 9000,
	useSSL: false,
	accessKey: "minioUser",
	secretKey: "minioPass",
});


export const UploadFileToMinio = async (file: any): Promise<boolean> => {
	let success = false;
	try {
		await minioClient.putObject("doggr", file.filename, file.file, (error: any, etag: any) => {
			if (error) {
				console.log("Minio client putObject failed: ", error);

				success=false;
			} else {
				console.log("Succesfully uploaded file");
				success=true;
			}
		});
	} catch (err) {
		console.log("In upload file to minio with err: ", err);
		success = false;
	}

	return success;

};

"use client";

import {
	AlertCircle,
	CheckCircle,
	Database,
	FileText,
	Loader2,
	Upload,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

export default function ImportCsvPage() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadStatus, setUploadStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	async function handleUpload() {
		if (!file) return;

		setIsUploading(true);
		setUploadProgress(0);
		setUploadStatus("idle");
		setErrorMessage("");

		try {
			// Simulate progress for better UX
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			const text = await file.text();

			const res = await fetch("/api/import-csv", {
				method: "POST",
				headers: {
					"Content-Type": "text/plain",
				},
				body: text,
			});

			clearInterval(progressInterval);
			setUploadProgress(100);

			if (!res.ok) {
				const data = await res.json();
				setUploadStatus("error");
				setErrorMessage(data.error || "Upload failed");
			} else {
				setUploadStatus("success");
			}
		} catch (error) {
			setUploadStatus("error");
			setErrorMessage("Network error occurred");
			setUploadProgress(0);
		} finally {
			setIsUploading(false);
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0] ?? null;
		setFile(selectedFile);
		setUploadStatus("idle");
		setUploadProgress(0);
		setErrorMessage("");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">
						ForeFlight CSV Importer
					</h1>
					<p className="text-gray-600">
						Convert and upload your ForeFlight CSV exports to PostgreSQL
						database
					</p>
				</div>

				{/* Main Card */}
				<div className="bg-white rounded-lg shadow-lg border border-gray-200">
					<div className="p-6 text-center border-b border-gray-200">
						<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
							<Database className="w-8 h-8 text-blue-600" />
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Upload CSV File
						</h2>
						<p className="text-gray-600 text-sm">
							Select your ForeFlight CSV export file to process and upload to
							the database
						</p>
					</div>

					<div className="p-6 space-y-6">
						{/* File Input */}
						<div className="space-y-2">
							<label
								htmlFor="csv-file"
								className="block text-sm font-medium text-gray-700"
							>
								Choose CSV File
							</label>
							<input
								id="csv-file"
								type="file"
								accept=".csv"
								onChange={handleFileChange}
								disabled={isUploading}
								className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							/>
							{file && (
								<div className="mt-2 flex items-center text-sm text-gray-600">
									<FileText className="w-4 h-4 mr-2" />
									<span>
										{file.name} ({(file.size / 1024).toFixed(1)} KB)
									</span>
								</div>
							)}
						</div>

						{/* Progress Bar */}
						{isUploading && (
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">Processing...</span>
									<span className="text-gray-600">{uploadProgress}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							</div>
						)}

						{/* Status Messages */}
						{uploadStatus === "success" && (
							<div className="border border-green-200 bg-green-50 rounded-md p-4">
								<div className="flex items-center">
									<CheckCircle className="h-4 w-4 text-green-600 mr-2" />
									<span className="text-green-800 text-sm">
										CSV file uploaded and processed successfully!
									</span>
								</div>
							</div>
						)}

						{uploadStatus === "error" && (
							<div className="border border-red-200 bg-red-50 rounded-md p-4">
								<div className="flex items-center">
									<AlertCircle className="h-4 w-4 text-red-600 mr-2" />
									<span className="text-red-800 text-sm">
										Upload failed: {errorMessage}
									</span>
								</div>
							</div>
						)}

						{/* Upload Button */}
						<button
							type="button"
							onClick={handleUpload}
							disabled={!file || isUploading}
							className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
						>
							{isUploading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Processing...</span>
								</>
							) : (
								<>
									<Upload className="w-4 h-4" />
									<span>Upload to Database</span>
								</>
							)}
						</button>
					</div>
				</div>

				{/* Info Card */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg">
					<div className="p-6">
						<div className="flex items-start space-x-3">
							<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<FileText className="w-3 h-3 text-blue-600" />
							</div>
							<div className="space-y-1">
								<h3 className="font-medium text-blue-900">Supported Format</h3>
								<p className="text-sm text-blue-700">
									This tool accepts CSV files exported from ForeFlight. Make
									sure your file contains the required columns and is properly
									formatted.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

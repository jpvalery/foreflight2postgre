"use client";

import { useState } from "react";

export default function ImportCsvPage() {
	const [file, setFile] = useState<File | null>(null);

	async function handleUpload() {
		if (!file) return;

		const text = await file.text();

		const res = await fetch("/api/import-csv", {
			method: "POST",
			headers: {
				"Content-Type": "text/plain",
			},
			body: text,
		});

		if (!res.ok) {
			const data = await res.json();
			alert(`Upload failed: ${data.error}`);
		} else {
			alert("Upload successful");
		}
	}

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-xl font-semibold">Upload CSV</h1>
			<input
				type="file"
				accept=".csv"
				onChange={(e) => setFile(e.target.files?.[0] ?? null)}
			/>
			<button
        type="button"
				onClick={handleUpload}
				className="px-4 py-2 bg-blue-600 text-white rounded"
			>
				Upload
			</button>
		</div>
	);
}

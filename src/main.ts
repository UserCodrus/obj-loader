import fs from "node:fs/promises";

// The file extension for output files
const fextension = "ucm";

// Make sure the user provided an file path
if (process.argv.length < 3) {
	console.error("No file path specified.");
} else if (process.argv.length < 4) {
	console.error("No file name specified.");
} else {
	const path = process.argv[2];
	const filename = process.argv[3];

	try {
		// Open the file
		const file = await fs.readFile(path);
		console.log(`Parsing ${path}`);

		// Read each line of the file and separate the data based on the line's content
		const lines = file.toString().split('\n');

		const vertices: number[][] = [];	// Vertex coordinates
		const uvs: number[][] = [];			// Texture coordinates
		const normals: number[][] = [];		// Normal vectors
		const polys: string[][] = [];		// Polygon data

		for (const line of lines) {
			const tokens = line.split(' ');
			if (tokens.length > 0) {
				switch(tokens[0]) {
					case "f": {
						tokens.shift();
						polys.push(tokens);
						break;
					}

					case "v": {
						tokens.shift();
						vertices.push(tokens.map((value) => Number(value)));
						break;
					}

					case "vt": {
						tokens.shift();
						uvs.push(tokens.map((value) => Number(value)));
						break;
					}

					case "vn": {
						tokens.shift();
						normals.push(tokens.map((value) => Number(value)));
						break;
					}
				}
			}
		}

		console.log(`${polys.length} polygons, ${vertices.length} vertices, ${normals.length} normals, ${uvs.length} UVs`);

		// Pack vertex data into a single array and generate indices for the triangles
		const vertex_data: number[] = [];
		const indices: number[] = [];
		const vertex_group: string[] = [];

		for (const face of polys) {
			for (const vertex of face) {
				const index = vertex_group.findIndex((value) => vertex === value);
				if (index > -1) {
					// If the vertex has already been added, just add its index
					indices.push(index);
				} else {
					// Add data for the new vertex
					vertex_group.push(vertex);
					const vertex_pairs = vertex.split('/').map((value) => Number(value) - 1);

					vertex_data.push(...vertices[vertex_pairs[0]]);
					vertex_data.push(...uvs[vertex_pairs[1]]);
					vertex_data.push(...normals[vertex_pairs[2]]);

					indices.push(vertex_group.length - 1);
				}
			}
		}

		// Add the size of the index buffer to the start of the index array so it appears at the beginning of the file
		indices.unshift(indices.length);

		// Combine the arrays and push them to a file
		const vertex_array = new Float32Array(vertex_data);
		const index_array = new Uint16Array(indices);

		const file_buffer = new Uint8Array(vertex_array.byteLength + index_array.byteLength);
		file_buffer.set(new Uint8Array(index_array.buffer));
		file_buffer.set(new Uint8Array(vertex_array.buffer), index_array.byteLength);

		console.log(`Writing ${filename}.${fextension}`);
		await fs.writeFile(`./${filename}.${fextension}`, file_buffer);

		console.log(`Process complete.`);

	} catch(error) {
		// Display error messages
		if (error instanceof Error) {
			console.error(error.message);
		}
	}
}
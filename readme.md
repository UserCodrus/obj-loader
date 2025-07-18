A simple command line utility that converts .obj files into binary blobs for faster loading.

## Installation

Run **node install** to install dependencies then **npm run build** to build the source.

## Usage

**npm start "/path/to/file.obj" output_file_name**

The script will produce two files - one named **output_file_name.vertex** containing vertex data and one named **output_file_name.index** containing triangle indices.
## Cloud Optimized Map Tiles (COMTiles)

Based on the ideas of [Cloud Optimized GeoTIFF](https://www.cogeo.org/) and extended for the usage of raster and in particular vector map tilesets.
COMTiles are a streamable and read optimized file archive for hosting map tiles at global scale on a cloud object storage.
Currently most geospatial data formats (like MBTiles, Shapefiles, KML, ...) were developed only with the POSIX filesystem access in mind.
COMTiles in contrast is designed to be hosted only on a cloud object storage like AWS S3 or Azure Blob Storage without the need for a database or server on the backend side.
The map tiles can be accessed directly from a browser via http range requests.
The main focus of COMTiles is to significantly reduce coasts and simplify the hosting of large raster and vector tilesets at global scale 
in the cloud.
Via COMTiles an object storage can be used as a spatial database for the visualization of map tiles. 
COMTiles aims to be a MBTiles database for the cloud.

### Concept  
The basic idea is to use an additional `index ` which stores the address within the archive for and the size of a specific map tile.     
For a planet wide vector tileset the index has about 3GB of size.    
Because of this the index also has to be streamable to allow a fluent user experience already known for maps like Google Maps or OpenStreetMap.    
One main design goal of COMTiles is to reduce the number of http requests for the download of the index for performance and cost reasons.    
With Space Filling Curves (Hilber, Z-Order, Row-Major), directory based and fragment based different approaches had been evaluated
for finding the most effective way for structuring the index.  
Tests showed that subdividing the index peer zoom level in so called ``index fragments`` seems to be the most effective approach 
in terms of the number of http range requests.
The number of index entries (records) per fragment are specified via the aggreationCoefficent in tileMatrix definiton of the

The fragment coordiante system always starts at the top right.
Depending of the extend of the tilset the fragments can be sparse or dense.
This can be calculated

The extend of the tileset is described via OGC Matrix in the metadata document.


A COMTiles file archive has the following layout:  
![layout](assets/layout.svg)

The user should not notice that additonal fetch requests

A COMTiles archive mainly consists of a header with metadata, an index and the actual map tiles.
The index
The index is also streamable which means that only parts of the index can be requested

Different approaches haven been evaluated: SFC, Directory based and fragments

Most of the time only one additional fetch is need.
For example if we use a tileset of europe.
Zoom 0-10 are in the initial fetch.
For exploring a city like munich and die enviornment only one additonal
fetch for 11-14 is needed, which means 4 additional fetches for index fagments (37kb) are needed.


A COMT archive consists of the following parts:
- Header  
  Contains in particular the metadata which describes the TileSet.  
  The metadata has a TileMatrixSet definition which describes the extend of the TileSet.  
  The concept and structure of the TileMatrixSet is inspired by the OGC draft 'OGC Two Dimensional Tile Matrix Set' .  
- Index  
  The index is designed for the minimal number of request -> performance and many
  In most cases only one index fragment fetch is needed before accessing the tiles. This can be cached later on.
  The index references the map tiles in the data section`` in a compact way and consists of a collection of index entries.  
  A index entry consist of a offset to the tile (default 5 bytes) and a size of a tile (4 bytes) in the data section.  
  One important concept of COMTiles is that the index is also streamable which means that only parts of the index (fragments) can be requested
  via http range requests.
  The index is structured in a way that the index entries of the index which are intersecting the current
  viewport of the map (and also with a additional buffer) can be requested with a minimal number of HTTP requests.  
- Body  
  Contains the actual raster or vector tiles.  

### Use Cases
- Displaying map tiles in the browser via a web mapping framework like MapLibreGL JS
- Downloading map extracts for the offline usage in apps
- Downloading map extracts for the hosting on a dedicated on-premise infrastructure

### Tools
mbitle-convert --max-old-space
maplibre-provider for MapLibre -> for a example of how to use see the debug page
Or use your own build on top of the ComtCache in the @comt/provider package


### Repository structure
- @comt/spec -> COMT file format specification
- @comt/provider -> Utility functions for working with COMTiles
- @comt/maplibre-provider -> COMTiles provider for MapLibre GL JS  
- @comt/server -> MapServer for serving tiles, can be hosted in a cloud native (serverless) environment
- @comt/mbtiles-converter -> Converting map tiles stored in a MBTiles database to a COM Tiles archive
- @comt/tilelive-comtiles -> Integration into tilelive for generating Mapbox Vector Tiles 

### Demo
In the following examples the map tiles are based on a MBTiles database from [MapTiler](https://www.maptiler.com/data/)  and converted to
a COMTiles archive with the mbtiles-converter.  
Example video with a europe tileset hosted on a local MinIO storage with a disabled browser cache:
[![COMTiles YouTube video](./assets/MinIO.png)](https://www.youtube.com/watch?v=puaJVVxT_KA)

Example video with a europe tileset hosted on a AWS S3 standard storage with a disabled browser cache:
[![COMTiles YouTube video](./assets/AwsS3.png)](https://www.youtube.com/watch?v=5StxZbfvMUw)


### Advantages over directly hosting the map tiles
Loading up over 350 million tiles for a planet scale vector tiels dataset is expensive in the upload and time consuming.
Also it's hard to handle such a large number of files and leaded to the creation of MBTiles.
-> purpose of geopackage or MBTiles
also the water tiles which are 2/3 of the whole planet dataset is inprecticble
Any global-scale map system must acknowledge the earth is 70% ocean. Map image APIs already take advantage of this by special-casing solid blue PNG images.
and wasting of money
One archive file with the metdata and tiles in one file.
-> time consuming
-> put request costs
-> water tiles have to be stored
-> not a single format for metadata

### Similar formats
#### Cloud Optimized GeoTiff
#### GeoFlatBuf
#### PMTiles
#### Cotar
Index is not streamable which limits the use case for smaller extracts

### References
- https://medium.com/planet-stories/cloud-native-geospatial-part-2-the-cloud-optimized-geotiff-6b3f15c696ed
- https://towardsdatascience.com/turn-amazon-s3-into-a-spatio-temporal-database-40f1a210e943
- https://github.com/flatgeobuf/flatgeobuf
- https://medium.com/@mojodna/tapalcatl-cloud-optimized-tile-archives-1db8d4577d92
- https://docs.tiledb.com/main/basic-concepts/terminology
- https://github.com/protomaps/PMTiles


  
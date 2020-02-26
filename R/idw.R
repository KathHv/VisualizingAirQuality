##########################################
##########################################
## IMPORTANT:
##
## If file.rename returns FALSE
## R wasn't able to create the GeoTIFF
## 
##########################################
##########################################
library(ggplot2)
library(gstat)
library(rgdal)
library(RColorBrewer)
library(mapview)

# generel settings
buffer = 1 # buffer used for the grid while interpolation
data_date = "14-11" # "14-11" or  "19-12"
mapviewOptions(basemaps = c("OpenStreetMap", "Esri.WorldImagery"),
               raster.palette = colorRampPalette(rev(brewer.pal(9, "RdYlGn"))),
               vector.palette = colorRampPalette(brewer.pal(9, "YlGnBu")),
               na.color = "magenta",
               layers.control.pos = "topright")


# in- and output filename
in_name = paste("./../data/bike_", data_date, ".csv", sep="")
out_name = paste("./../data/idw_", data_date, ".tif", sep="")

# read the data
bike <- read.csv(in_name, header=TRUE)
bike = na.omit(bike)

# define x & y as longitude and latitude
bike$x <- bike$lon
bike$y <- bike$lat

# Set spatial coordinates to create a Spatial object
coordinates(bike) = ~x + y

# Plot the results
plot(bike)

# # Define the grid extent
# aoi_extent.maxx = max(bike$lon)
# aoi_extent.maxy = max(bike$lat)
# aoi_extent.minx = min(bike$lon)
# aoi_extent.miny = min(bike$lat)
# 
# aoi_extent.maxx = ceiling(aoi_extent.maxx*1000 +buffer)/1000
# aoi_extent.minx = floor(aoi_extent.minx*1000 -buffer)/1000
# aoi_extent.maxy = ceiling(aoi_extent.maxy*1000 +buffer)/1000
# aoi_extent.miny = floor(aoi_extent.miny*1000 -buffer)/1000

# define a grid which larger extent
aoi_extent.maxy = 51.964 
aoi_extent.miny = 51.931
aoi_extent.maxx = 7.659
aoi_extent.minx = 7.581

# create a data frame grid for interpolation
aoi <- expand.grid(x = seq(from = aoi_extent.minx, to = aoi_extent.maxx, by = 0.0001), y = seq(from = aoi_extent.miny, to = aoi_extent.maxy, by = 0.0001)) # expand points to grid
coordinates(aoi) <- ~x + y 
gridded(aoi) <- TRUE

# plot the interpolation area and bike
plot(aoi, col="grey")
points(bike, col = "red")

# inverse distance weighted interpolation
idw <- idw(formula = pm10 ~ 1, locations = bike, newdata = aoi)
idw.output = as.data.frame(idw)
names(idw.output)[1:3] <- c("lon", "lat", "pm10")

# check for NA
any(is.na(idw$var1.pred))

# Plot the results as image
ggplot() + 
 geom_tile(data = idw.output, aes(x = lon, y = lat, fill=pm10)) + 
 geom_point(data = as.data.frame(bike), aes(x=lon, y=lat), shape=21, colour="red")

# Plot the results as map
proj4string(idw) <- CRS("+init=epsg:4326")
mapView(idw, zcol="var1.pred", at = c(0,5,10,15,20,40,80))

# save idw as geoTIFF
idw$var1.var <- NULL
outfilename <- tempfile(pattern="file", tmpdir = tempdir())
writeGDAL(idw, outfilename, drivername = "GTiff")
file.rename (outfilename, out_name)
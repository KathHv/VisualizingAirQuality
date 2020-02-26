library(ggplot2)
library(dplyr) #  for glimpse
library("RColorBrewer")

# read the data
bike <- read.csv("./../data/bike_14-11.csv", header=TRUE)

# get some first imformation
glimpse(bike)

# define own color palette and draw the data
myPalette <- colorRampPalette(rev(brewer.pal(11, "Spectral")))
sc <- scale_colour_gradientn(colours = myPalette(100), limits=c(0, 65))
ggplot(bike, aes(x=lon, y =lat, color = pm10)) + geom_point(size = bike$pm10/10) + sc + coord_fixed(ratio = 1)

# subsetting the data by coords
sb = subset(bike, lat > 51.933 & lat < 51.943 & lon > 7.607 & lon < 7.617)
ggplot(sb, aes(x=lon, y =lat, color = pm10)) + geom_point(size = sb$pm10/10) + sc + coord_fixed(ratio = 1)

# subsettig the data by rownumber
sbl = bike[3000:3900,]
ggplot(sbl, aes(x=lon, y =lat, color = pm10)) + geom_point(size = sbl$pm10/10) + sc + coord_fixed(ratio = 1)

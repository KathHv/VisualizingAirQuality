library(ggplot2)
library("RColorBrewer")
bike <- read.csv("./../bike_14-11.csv", header=TRUE)
glimpse(bike)

myPalette <- colorRampPalette(rev(brewer.pal(11, "Spectral")))
sc <- scale_colour_gradientn(colours = myPalette(100), limits=c(0, 65))
ggplot(bike, aes(x=lon, y =lat, color = pm10)) + geom_point(size = bike$pm10/10) + sc + coord_fixed(ratio = 1)

sb = subset(bike, lat > 51.933 & lat < 51.943 & lon > 7.607 & lon < 7.617)
ggplot(sb, aes(x=lon, y =lat, color = pm10)) + geom_point(size = sb$pm10/10) + sc + coord_fixed(ratio = 1)
apm10 = bike$pm10
adif = apm10[2:length(apm10)]-apm10[1:length(apm10)-1]

sbl = bike[,3000:3900]
ggplot(sbl, aes(x=lon, y =lat, color = pm10)) + geom_point(size = sbl$pm10/10) + sc + coord_fixed(ratio = 1)
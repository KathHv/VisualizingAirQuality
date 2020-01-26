#######################################################
library(dplyr)
library(raster)
library(moments)


bike_1411 = read.csv("./bike_14-11.csv", header = TRUE)
bike_1411 = na.omit(bike_1411)
bike_1912 = read.csv("./bike_19-12_short.csv", header = TRUE)
bike_1912 = na.omit(bike_1912)

######
glimpse(bike_1411)

head(bike_1411)
tail(bike_1411)

min(bike_1411$pm10)
max(bike_1411$pm10)
mean(bike_1411$pm10)
median(bike_1411$pm10)
var(bike_1411$pm10)
sd(bike_1411$pm10)
quantile(bike_1411$pm10, 0.90)
skewness(bike_1411$pm10)

######
glimpse(bike_1912)

head(bike_1912)
tail(bike_1912)

min(bike_1912$pm10)
max(bike_1912$pm10)
mean(bike_1912$pm10)
median(bike_1912$pm10)
var(bike_1912$pm10)
sd(bike_1912$pm10)
quantile(bike_1912$pm10, 0.90)
skewness(bike_1912$pm10)
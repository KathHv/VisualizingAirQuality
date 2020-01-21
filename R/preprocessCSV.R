bike = read.csv("1Hertz_Messdaten_14.11.csv")
bike_shorten = bike[,c("TIMESTAMP","RECORD","lat","lon","AirTC_Avg","RH_Avg")]

bike_shorten$pm25 = rowSums(bike[,c(38:47)])
bike_shorten$pm10 = rowSums(bike[,c(38:53)])

View(bike_shorten)
write.csv(bike_shorten,"bike_14-11.csv")

#sapply(bike[,c(38:53)], min, na.rm = TRUE)
sapply(bike[,c(38:53)], max, na.rm = TRUE)

bike_2 = read.csv("2019-12-19_fasttable.csv")
bike_2 = bike_2[,-1]
bike_2_shorten = bike_2[,c("TIMESTAMP","RECORD","lat","lon","AirTC_Avg","RH_Avg")]

bike_2_shorten$pm25 = rowSums(bike_2[,c(38:47)])
bike_2_shorten$pm10 = rowSums(bike_2[,c(38:53)])

View(bike_2_shorten)
write.csv(bike_2_shorten,"bike_19-12.csv")

#sapply(bike_2[,c(38:53)], min, na.rm = TRUE)
sapply(bike_2[,c(38:53)], max, na.rm = TRUE)


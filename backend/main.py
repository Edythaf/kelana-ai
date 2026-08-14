#Variables store the trip data
destination = str(input("Desitnation : "))
country = str(input("Country : "))
days = int(input("Days : "))
budget = float(input("Budget : "))
currency = str(input("Currency : "))
travel_month = str(input("Travel month : "))


#travel_style = input("Travel Style : ")
#hotel_cost = input("Hotel Cost :")
#transportation_cost = input("Transportation Cost : ")
#food_cost = input("Food Cost : ")
#miscellaneous_cost = input("Miscellaneous Cost: ")
#total_estimated_cost = (hotel_cost + transportation_cost + food_cost + miscellaneous_cost)



#def print_trip_summary(destination, country, days, budget, currecy, travel_month):
#  print("=======================")
#  print("KelanaAI")
#  print("=======================")
#  print(f"Desitination    : {destination}")
#  print(f"Country         : {country}")
#  print(f"Days            : {days} ")
#  print(f"Budget          : {budget}")
#  print(f"Currency        : {currecy}")
#  print(f"Travel Month    : {travel_month}")
#  print(f"Travel Style   : {travel_style}")

from services.trip_services import (
    calculate_daily_budget,
    get_trip_category, 
    get_travel_season, 
    recommended_places)

daily_budget = calculate_daily_budget(budget, days)
category = get_trip_category(budget)
season = get_travel_season(travel_month)

print()
print("KelanaAI")
print("==============================")
print(f"Desitination    : {destination}")
print(f"Days            : {days} ")
print(f"Budget          : {budget} {currency}/Day")
print(f"Travel Month    : {travel_month}")
print(f"Season          : {season}")

print()
print("Recommended Places")
for place in recommended_places:
    print(f"- {place}")
    
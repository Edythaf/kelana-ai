#Variables store the trip data
destination = str(input("Desitnation : "))
country = str(input("Country : "))
days = int(input("Days : "))
budget = float(input("Budget : "))
currecy = str(input("Currency : "))
travel_month = str(input("Travel month : "))


#travel_style = input("Travel Style : ")
#hotel_cost = input("Hotel Cost :")
#transportation_cost = input("Transportation Cost : ")
#food_cost = input("Food Cost : ")
#miscellaneous_cost = input("Miscellaneous Cost: ")
#total_estimated_cost = (hotel_cost + transportation_cost + food_cost + miscellaneous_cost)



def print_trip_summary(destination, country, days, budget, currecy, travel_month):
    print("=======================")
    print("KelanaAI")
    print("=======================")
    print(f"Desitination    : {destination}")
    print(f"Country         : {country}")
    print(f"Days            : {days} ")
    print(f"Budget          : {budget}")
    print(f"Currency        : {currecy}")
    print(f"Travel Month    : {travel_month}")
   # print(f"Travel Style   : {travel_style}")

print_trip_summary(destination, country, days, budget, currecy, travel_month)
#if total_estimated_cost > budget:
 #   print("⚠ Budget exceeded.")


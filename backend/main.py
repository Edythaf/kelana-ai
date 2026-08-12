#Variables store the trip data
destination = input("Desitnation : ")
days = input("Days : ")
budget = input("Budget : ")
travel_style = input("Travel Style : ")
hotel_cost = input("Hotel Cost :")
transportation_cost = input("Transportation Cost : ")
food_cost = input("Food Cost : ")
miscellaneous_cost = input("Miscellaneous Cost: ")
total_estimated_cost = (hotel_cost + transportation_cost + food_cost + miscellaneous_cost)



def print_trip_summary(destination, days, budget, travel_style):
    print("=======================")
    print("KelanaAI")
    print("=======================")
    print(f"Desitination    : {destination}")
    print(f"Days            : {days} ")
    print(f"Budget          : {budget}")
    print(f"Travel Style   : {travel_style}")

print_trip_summary(destination, days, budget, travel_style)
if total_estimated_cost > budget:
    print("⚠ Budget exceeded.")


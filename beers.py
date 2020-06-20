"""
99 Bottles of Beer.
"""
from time import sleep

for num in range(3, 0, -1):
    if num > 1:
        print(f"{num} bottles of beer on the wall, {num} bottles of beer.")
        if num > 2:
            suffix = f"{num -1} bottles of beer on the wall."
        else:
            suffix = f"{num} bottles of beer on the wall."
    elif num == 1:
        print(f"{num} bottle of beer on the wall, {num} bottle of beer.")
        suffix = "no more beer on the wall!"
    print(f"Take one down, pass it around, {suffix}")
    print("--")
    sleep(2)

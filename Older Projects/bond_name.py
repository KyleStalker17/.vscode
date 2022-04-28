from turtle import title


first = input("What's your first name? ");
last = input("What's your last name? ");
jTitle = input("Please enter your job title ")
idNumber = input("Please input your Identification Number ")
email = input("Please input your E-mail ")
Phone = input('Please enter your Phone Number ')
eyeColor = input('Eye Color? ')
hairColor = input("Hair Color ") 
month = input('Which month did you start working for us? ')
training = input('Have you completed advanced training? ')

print()
print("-----------------------------------")
print(last.upper(),',',first.capitalize())
print(jTitle.title())
print('ID:',idNumber)
print()
print(email.lower())
print(Phone)
print()
print('Eye Color:',eyeColor,'     ','Hair Color:',hairColor)
print('month:',month,'     ','Training:',training)
print('---------------------------------------------')



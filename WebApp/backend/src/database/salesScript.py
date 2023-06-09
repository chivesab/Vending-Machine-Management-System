import mysql.connector
from datetime import date, datetime, time, timedelta
import random
import uuid
import numpy as np
import json

with open('config.json', 'r') as f:
    config = json.load(f)['DB']

conn = mysql.connector.connect(
	host=config['host'],
	user=config['username'],
	passwd=config['password'],
	port=config['port'],
	db=config['database']
)

cursor = conn.cursor(buffered=True)

query = ("SELECT * from items")

# result = cursor.execute(query)
# print(result)

today = datetime.now().date()

machine_ids = [
	'4c502e60-4b51-11ec-902a-b05adad3c217',
	'4c51a993-4b51-11ec-902a-b05adad3c217',
	'4c531d92-4b51-11ec-902a-b05adad3c217',
	'4c54a982-4b51-11ec-902a-b05adad3c217',
	'4c55aa1d-4b51-11ec-902a-b05adad3c217',
	'4c574e73-4b51-11ec-902a-b05adad3c217',
	'4c586d6e-4b51-11ec-902a-b05adad3c217',
	'4c59c144-4b51-11ec-902a-b05adad3c217',
	'4c5ac9d1-4b51-11ec-902a-b05adad3c217',
	'4c5c2ab1-4b51-11ec-902a-b05adad3c217'
]

drink_ids = [
	'102f61f8-4b51-11ec-902a-b05adad3c217',
	'1030b8e3-4b51-11ec-902a-b05adad3c217',
	'10322a92-4b51-11ec-902a-b05adad3c217',
]

food_ids = [
	'1036a9da-4b51-11ec-902a-b05adad3c217',
	'103bfff9-4b51-11ec-902a-b05adad3c217'
]

snack_ids = [
	'1033e3b6-4b51-11ec-902a-b05adad3c217',
	'1034dd74-4b51-11ec-902a-b05adad3c217',
	'1037b911-4b51-11ec-902a-b05adad3c217',
	'103955b3-4b51-11ec-902a-b05adad3c217',
	'103a7fbf-4b51-11ec-902a-b05adad3c217'
]

drink_ratio = 0.6
snack_ratio = 0.3
food_ratio = 0.1

item_price = {
	'102f61f8-4b51-11ec-902a-b05adad3c217': 2.0,
	'1030b8e3-4b51-11ec-902a-b05adad3c217': 2.5,
	'10322a92-4b51-11ec-902a-b05adad3c217': 3.0,
	'1036a9da-4b51-11ec-902a-b05adad3c217': 5.0,
	'103bfff9-4b51-11ec-902a-b05adad3c217': 1.5,
	'1033e3b6-4b51-11ec-902a-b05adad3c217': 1.5,
	'1034dd74-4b51-11ec-902a-b05adad3c217': 2.0,
	'1037b911-4b51-11ec-902a-b05adad3c217': 3.5,
	'103955b3-4b51-11ec-902a-b05adad3c217': 1.5,
	'103a7fbf-4b51-11ec-902a-b05adad3c217': 2.0
}

card_numbers = [str(i) for i in np.random.randint(1e15, 1e16, 50)]

def pickAnItem():
	r = random.random()
	if r < drink_ratio:
		return drink_ids[random.randint(0, len(drink_ids) -1)]
	elif r < drink_ratio + snack_ratio:
		return snack_ids[random.randint(0, len(snack_ids) -1)]
	else:
		return food_ids[random.randint(0, len(food_ids) -1)]

def addToBasket(basket, itemId):
	if itemId in basket:
		basket[itemId] += 1
	else:
		basket[itemId] = 1

def getBasketSize():
	r = random.random()
	if r < 0.6:
		return 1
	elif r < 0.85:
		return 2
	elif r < 0.95:
		return 3
	return 4

def createBasket():
	basket = {}
	
	for i in range(getBasketSize()):
		addToBasket(basket, pickAnItem())

	return basket

def insertIntoPayments(payment_id, price, timestamp):
	query = (
		"INSERT INTO payments"
		"(payment_id, price, credit_card_number, p_time, machine_id)"
		"VALUES (%s, %s, %s, %s, %s)"
	)

	payment = (
		payment_id, 
		price, 
		card_numbers[random.randint(0, len(card_numbers)-1)],
		timestamp,
		machine_ids[random.randint(0, len(machine_ids) -1)]
	)


	cursor.execute(query, payment)

def insertIntoPaymentItem(payment_id, product_id, quantity):
	unit_price = item_price[product_id]
	query = (
		"INSERT INTO payment_item"
		"(payment_id, product_id, unit_price, quantity)"
		"VALUES (%s, %s, %s, %s)"
	)

	cursor.execute(query, (payment_id, product_id, unit_price, quantity))

def getBasketSum(basket):
	sum = 0
	for key in basket:
		sum += item_price[key] * basket[key]
	return sum

for i in range(30):
	current_date = today + timedelta(days=-i)
	timestamp = current_date.strftime('%Y-%m-%d %H:%M:%S')
	weekday = current_date.weekday()
	# weekend


	if weekday > 4:
		time_runs = random.randint(3, 8)
	else: 
		time_runs = random.randint(25, 40)

	for i in range(time_runs):
		payment_id = str(uuid.uuid4())
		basket = createBasket()
		sum = getBasketSum(basket)
		insertIntoPayments(payment_id, sum, timestamp)
		for key in basket:
			insertIntoPaymentItem(payment_id, key, basket[key])




conn.commit()
cursor.close()
conn.close()
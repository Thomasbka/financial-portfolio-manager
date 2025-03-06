# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

puts "Starting seeds..."

puts "Destroying old records..."
User.destroy_all
Position.destroy_all
Tracker.destroy_all
puts "Old records destroyed."

puts "Creating user..."
user = User.create!(name: "Alice", email: "alice@example.com", password: "password", password_confirmation: "password")
puts "User created: #{user.inspect}"

puts "Creating position..."
Position.create!(
  user: user,
  symbol: "AAPL",
  buy_price: 130.00,
  quantity: 10,
  current_price: 145.50
)
puts "Position created."

puts "Creating tracker..."
Tracker.create!(
  user: user,
  symbol: "TSLA",
  sentiment: "bullish",
  technical: "uptrend"
)
puts "Tracker created."

puts "Seeds completed!"

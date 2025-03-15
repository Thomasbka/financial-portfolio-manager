class CreateTrades < ActiveRecord::Migration[6.1]
  def change
    create_table :trades do |t|
      t.references :position, null: false, foreign_key: true
      t.integer :sold_quantity
      t.decimal :buy_price
      t.decimal :sell_price
      t.decimal :profit
      t.datetime :trade_date

      t.timestamps
    end
  end
end

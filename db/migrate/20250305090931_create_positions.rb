class CreatePositions < ActiveRecord::Migration[6.1]
  def change
    create_table :positions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :symbol
      t.decimal :buy_price
      t.integer :quantity
      t.decimal :current_price

      t.timestamps
    end
  end
end

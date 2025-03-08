class AddExtraFieldsToPositions < ActiveRecord::Migration[6.1]
  def change
    add_column :positions, :name, :string
    add_column :positions, :dividend_yield, :decimal
    add_column :positions, :buy_date, :date
  end
end

class AddDividendPaymentsToPositions < ActiveRecord::Migration[6.1]
  def change
    add_column :positions, :dividend_payments, :text
  end
end

class AddRealizedPlToPositions < ActiveRecord::Migration[6.1]
  def change
    add_column :positions, :realized_pl, :decimal
  end
end

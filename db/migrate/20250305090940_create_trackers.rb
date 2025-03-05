class CreateTrackers < ActiveRecord::Migration[6.1]
  def change
    create_table :trackers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :symbol
      t.string :sentiment
      t.string :technical

      t.timestamps
    end
  end
end

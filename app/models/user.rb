class User < ApplicationRecord
  has_secure_password
  has_many :positions
  has_many :trackers

  validates :email, presence: true, uniqueness: true
end

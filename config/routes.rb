Rails.application.routes.draw do
  # API routes
  namespace :api, defaults: { format: :json } do
    resources :users, only: [:index, :show, :create, :update, :destroy]
    resources :positions
    resources :trackers
  end

  # SPA entry point
  root to: 'static_pages#dashboard'

  get '*path', to: 'static_pages#dashboard', constraints: ->(req) {
    !req.xhr? && req.format.html?
  }
end

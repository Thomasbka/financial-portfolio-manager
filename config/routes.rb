Rails.application.routes.draw do
  namespace :api do
    get 'trades/index'
    get 'trades/show'
    get 'trades/create'
  end
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'
  get '/logged_in', to: 'sessions#logged_in'


  namespace :api, defaults: { format: :json } do
    resources :users, only: [:index, :show, :create, :update, :destroy]
    resources :positions
    resources :trackers
    resources :trades, only: [:index, :show, :create]
  end

  namespace :api do
    get 'stocks/fetch', to: 'stocks#fetch'
  end

  root to: 'static_pages#dashboard'

  get '*path', to: 'static_pages#dashboard', constraints: ->(req) {
    !req.xhr? && req.format.html?
  }
end

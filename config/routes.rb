Rails.application.routes.draw do
  get 'static_pages/home'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root to: "static_pages#home"
  get 'demo' => 'static_pages#demo'
  get 'demo/*uri' => 'static_pages#demo'
end

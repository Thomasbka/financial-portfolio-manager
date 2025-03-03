Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root to: "static_pages#dashboard"
  get 'static_pages/dashboard'
  get 'portfolio' => 'static_pages#portfolio'
  get 'portfolio/*uri' => 'static_pages#portfolio'
  get 'analyser' => 'static_pages#analyser'
  get 'tracker' => 'static_pages#tracker'
  get 'history' => 'static_pages#history'
end

class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :set_current_user
  before_action :require_login

  def set_current_user
    @current_user = User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def require_login
    allowed_paths = ["/login", "/signup"]
    unless @current_user || allowed_paths.include?(request.path)
      if request.format.html?
        redirect_to '/login'
      else
      render json: { error: 'Not logged in' }, status: :unauthorized
      end
    end
  end
end
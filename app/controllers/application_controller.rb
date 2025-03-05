class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :set_current_user

  def set_current_user
    @current_user = User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def require_login
    unless @current_user
      render json: { error: 'Not logged in' }, status: :unauthorized
    end
  end
end

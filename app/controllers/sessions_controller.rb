class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { success: true, user: { id: user.id, email: user.email, name: user.name } }
    else
      render json: { success: false, error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def destroy
    session[:user_id] = nil
    render json: { success: true }
  end

  def logged_in
    if current_user
      render json: { logged_in: true, user: current_user }
    else
      render json: { logged_in: false }
    end
  end

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
end

module Api
  class UsersController < ApplicationController
    skip_before_action :require_login, only: [:create]
    def index
      @users = User.all
      render json: @users
    end

    def show
      @user = User.find(params[:id])
      render json: @user
    end

    def create
      @user = User.new(user_params)
      if @user.save
        session[:user_id] = @user.id
        render json: {success: true, user: @user}, status: :created
      else
        render json: {success: false, errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      @user = User.find(params[:id])
      if @user.update(user_params)
        render json: @user
      else
        render json: @user.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @user = User.find(params[:id])
      @user.destroy
      head :no_content
    end

    private

    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
  end
end

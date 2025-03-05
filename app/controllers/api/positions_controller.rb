module Api
  class PositionsController < ApplicationController
    def index
      @positions = Position.all
      render json: @positions
    end

    def show
      @position = Position.find(params[:id])
      render json: @position
    end

    def create
      @position = Position.new(position_params)
      if @position.save
        render json: @position, status: :created
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    def update
      @position = Position.find(params[:id])
      if @position.update(position_params)
        render json: @position
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @position = Position.find(params[:id])
      @position.destroy
      head :no_content
    end

    private

    def position_params
      params.require(:position).permit(:user_id, :symbol, :buy_price, :quantity, :current_price)
    end
  end
end

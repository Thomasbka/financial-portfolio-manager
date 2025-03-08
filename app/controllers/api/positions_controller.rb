module Api
  class PositionsController < ApplicationController
    before_action :require_login

    def index
      render json: @current_user.positions
    end

    def show
      position = @current_user.positions.find(params[:id])
      render json: position
    end

    def create
      @position = @current_user.positions.new(transformed_params)
      if @position.save
        render json: @position, status: :created
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    def update
      position = @current_user.positions.find(params[:id])
      if position.update(transformed_params)
        render json: position
      else
        render json: position.errors, status: :unprocessable_entity
      end
    end

    def destroy
      position = @current_user.positions.find(params[:id])
      position.destroy
      head :no_content
    end

    private

    def transformed_params
      raw = params.require(:position).permit(
        :symbol,
        :buy_price,
        :quantity,
        :current_price,
        :name,
        :dividend_yield,
        :buy_date
      )
      
      {
        symbol:         raw[:symbol],
        buy_price:      raw[:buy_price],
        quantity:       raw[:quantity],
        current_price:  raw[:current_price],
        name:           raw[:name],
        dividend_yield: raw[:dividend_yield],
        buy_date:       raw[:buy_date]
      }
    end
  end
end

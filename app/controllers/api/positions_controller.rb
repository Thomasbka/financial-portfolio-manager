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
    
      raw = params.require(:position).permit(
        :symbol,
        :buy_price,
        :quantity,
        :current_price,
        :name,
        :dividend_yield,
        :buy_date,
        :dividend_payments
      )
    
      updates = {
        symbol:            raw[:symbol]            || position.symbol,
        buy_price:         raw[:buy_price]         || position.buy_price,
        quantity:          raw[:quantity]          || position.quantity,
        current_price:     raw[:current_price]     || position.current_price,
        name:              raw[:name]              || position.name,
        dividend_yield:    raw[:dividend_yield]    || position.dividend_yield,
        buy_date:          raw[:buy_date]          || position.buy_date,
        dividend_payments: raw[:dividend_payments] || position.dividend_payments
      }
    
      if position.update(updates)
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
        :buy_date,
        :dividend_payments
      )

      {
        symbol:         raw[:symbol],
        buy_price:      raw[:buy_price],
        quantity:       raw[:quantity],
        current_price:  raw[:current_price],
        name:           raw[:name],
        dividend_yield: raw[:dividend_yield],
        buy_date:       raw[:buy_date],
        dividend_payments: raw[:dividend_payments]
      }
    end
  end
end

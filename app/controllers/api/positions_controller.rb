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
      @position = @current_user.positions.new(transformed_params.merge(realized_pl: 0))
      if @position.save
        render json: @position, status: :created
      else
        render json: @position.errors, status: :unprocessable_entity
      end
    end

    def update
      position = @current_user.positions.find(params[:id])
      
      permitted = params.require(:position).permit(
        :symbol,
        :buy_price,
        :quantity,
        :current_price,
        :name,
        :dividend_yield,
        :buy_date,
        :dividend_payments,
        :realized_pl
      ).to_h.symbolize_keys
    
      new_realized_pl = permitted.key?(:realized_pl) ? permitted[:realized_pl].to_f : position.realized_pl.to_f
    
      sell_qty = params[:sellQuantity].to_i
    
      if sell_qty > 0
        permitted_quantity = position.quantity - sell_qty
        sale_profit = sell_qty * (position.current_price - position.buy_price)
        new_realized_pl += sale_profit
      else
        permitted_quantity = permitted[:quantity].presence || position.quantity
      end
    
      updates = {
        symbol:            permitted[:symbol].presence || position.symbol,
        buy_price:         permitted[:buy_price].presence || position.buy_price,
        quantity:          permitted_quantity,
        current_price:     permitted[:current_price].presence || position.current_price,
        name:              permitted[:name].presence || position.name,
        dividend_yield:    permitted[:dividend_yield].presence || position.dividend_yield,
        buy_date:          permitted[:buy_date].presence || position.buy_date,
        dividend_payments: permitted[:dividend_payments].presence || position.dividend_payments,
        realized_pl:       new_realized_pl
      }
      
      if position.update(updates)
        if sell_qty > 0
          Trade.create!(
            position: position,
            sold_quantity: sell_qty,
            buy_price: position.buy_price,
            sell_price: position.current_price,
            profit: sale_profit,
            trade_date: Time.current
          )
        end
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
        :dividend_payments,
        :realized_pl
      )

      {
        symbol:            raw[:symbol],
        buy_price:         raw[:buy_price],
        quantity:          raw[:quantity],
        current_price:     raw[:current_price],
        name:              raw[:name],
        dividend_yield:    raw[:dividend_yield],
        buy_date:          raw[:buy_date],
        dividend_payments: raw[:dividend_payments],
        realized_pl:       raw[:realized_pl]
      }
    end
  end
end

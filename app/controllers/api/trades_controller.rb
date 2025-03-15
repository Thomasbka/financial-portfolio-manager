module Api
  class TradesController < ApplicationController
    before_action :require_login

    def index
      trades = Trade.joins(:position).where(positions: { user_id: @current_user.id })
    
      trades_json = trades.map do |trade|
        {
          id: trade.id,
          ticker: trade.position.symbol,
          name: trade.position.name,
          quantity: trade.sold_quantity,
          buyPrice: trade.buy_price.to_f,
          sellPrice: trade.sell_price.to_f,
          date: trade.trade_date,
        }
      end
      render json: trades_json
    end
    

    def show
      trade = Trade.find(params[:id])
      render json: trade
    end

    def create
      trade = Trade.new(trade_params)
      if trade.save
        render json: trade, status: :created
      else
        render json: trade.errors, status: :unprocessable_entity
      end
    end

    private

    def trade_params
      params.require(:trade).permit(:position_id, :sold_quantity, :buy_price, :sell_price, :profit, :trade_date)
    end
  end
end

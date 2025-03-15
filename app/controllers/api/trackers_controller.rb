module Api
  class TrackersController < ApplicationController
    before_action :require_login

    def index
      trackers = @current_user.trackers.order(created_at: :desc)
      render json: trackers
    end

    def show
      @tracker = Tracker.find(params[:id])
      render json: @tracker
    end

    def create
      @tracker = Tracker.new(tracker_params)
      @tracker.user = @current_user
      if @tracker.save
        render json: @tracker, status: :created
      else
        render json: @tracker.errors, status: :unprocessable_entity
      end
    end
    

    def update
      @tracker = Tracker.find(params[:id])
      if @tracker.update(tracker_params)
        render json: @tracker
      else
        render json: @tracker.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @tracker = Tracker.find(params[:id])
      @tracker.destroy
      head :no_content
    end

    private

    def tracker_params
      params.require(:tracker).permit(:user_id, :symbol, :sentiment, :technical)
    end
  end
end

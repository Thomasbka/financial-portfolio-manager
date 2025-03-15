require "test_helper"

class Api::TradesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_trades_index_url
    assert_response :success
  end

  test "should get show" do
    get api_trades_show_url
    assert_response :success
  end

  test "should get create" do
    get api_trades_create_url
    assert_response :success
  end
end

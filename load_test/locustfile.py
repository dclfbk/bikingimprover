from locust import task, HttpUser, between
import os

cookies = os.environ['COOKIES']

cookie_headers = {
  "Cookie": cookies
}


class HomePageUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def main(self):
        self.client.get("/")

        paths = [
            "/mytiles",
            '/posts/user/getUserClassification',
            '/manageShop/getPins',
            '/manageShop/getPowerUps',
            '/posts/node/getAllLayerNames',
            '/badgesTable/retrieve',

            '/posts/way/checkcompleted',
            '/posts/node/checkcompleted',


        ]
        for path in paths:
          self.client.get(path, headers=cookie_headers)
        

    @task
    def map(self):
      paths = [
        '/pbfFiles/CenterGeojson/TrentoCenter.geojson',
        '/pbfFiles/pinUser.geojson',
        '/pbfFiles/allWaysPbf/18/139163/93188.pbf',
        '/pbfFiles/allWaysPbf/18/139163/93189.pbf',
        '/pbfFiles/allWaysPbf/18/139164/93188.pbf',
        '/pbfFiles/allWaysPbf/18/139164/93189.pbf',
        '/pbfFiles/allWaysPbf/18/139162/93189.pbf',
        '/pbfFiles/allWaysPbf/18/139162/93188.pbf',
      ]

      for path in paths:
        self.client.get(path, headers=cookie_headers)

    # @task(3)
    # def view_item(self):
    #     for item_id in range(10):
    #         self.client.get(f"/item?id={item_id}", name="/item")

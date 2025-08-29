from flask import Flask, render_template, redirect, url_for, request, jsonify

app = Flask(__name__)

items = [
    {"id":1 , "name" :"item 1", "description": "this is task 1"},
    {"id":2 , "name" :"item 2", "description": "this is task 2"},
    {"id":3 , "name" :"item 3", "description": "this is task 3"},
    {"id":4 , "name" :"item 4", "description": "this is task 4"}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/items', methods = ['GET'])
def get_items():
    return jsonify(items)

# get: retrieve items based on id 
@app.route('/items/<int:item_id>', methods = ['GET'])
def get_item(item_id):
    item = next((item for item in items if item['id']==item_id), None)
    if item is None:
        return jsonify({"error":"item not found"})
    return jsonify(item)

# post: create new task
@app.route('/items', methods = ['POST'])
def create_item():
    if not request.json or not 'name' in request.json:
        return jsonify({"error": "Item not found"})
    
    new_item = {
        "id": items[-1]["id"] +1 if items else 1,
        "name":request.json["name"],
        "description": request.json["description"]
    }

    items.append(new_item)
    return jsonify(new_item)

# put: update an existing item
@app.route('/items/<int:item_id>', methods = ['PUT'])
def update_item(item_id):
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        return jsonify({"error": "Item not found"})
    item["name"] = request.json.get('name', item['name'])
    item["description"] = request.json.get('description', item['description'])
    return jsonify(item)

#delete: delete an existing item
@app.route('/items/<int:item_id>', methods = ['DELETE'])
def delete_item(item_id):
    global items
    items = next((item for item in items if item["id"] != item_id))
    return jsonify({"result": "Item deleted"})

if __name__ == "__main__":
    app.run(debug=True)

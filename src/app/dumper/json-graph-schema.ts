export const JSON_GRAPH_SCHEMA:Object = {
  "title": "JSON graph schema",
  "description": "JSON-graph schema that complies with JSON graph specification.",
  "type": "object",
  "properties": {
    "graph": {
      "$ref": "#/definitions/graph"
    }
  },
  "additionalProperties": false,
  "required": [
    "graph"
  ],
  "definitions": {
    "graph": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "label": {
          "type": "string"
        },
        "directed": {
          "type": [
            "boolean",
            "null"
          ],
          "default": true
        },
        "type": {
          "type": "string"
        },
        "metadata": {
          "type": [
            "object",
            "null"
          ]
        },
        "nodes": {
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "id": {
                "type": "string"
              },
              "type": {
                "type": "string"
              },
              "label": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "metadata": {
                "type": [
                  "object",
                  "null"
                ]
              }
            },
            "required": [
              "id"
            ]
          }
        },
        "edges": {
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "id": {
                "type": "string"
              },
              "source": {
                "type": "string"
              },
              "target": {
                "type": "string"
              },
              "relation": {
                "type": "string"
              },
              "directed": {
                "type": [
                  "boolean",
                  "null"
                ],
                "default": true
              },
              "label": {
                "type": "string"
              },
              "metadata": {
                "type": [
                  "object",
                  "null"
                ]
              }
            },
            "required": [
              "source",
              "target"
            ]
          }
        }
      }
    }
  }
}

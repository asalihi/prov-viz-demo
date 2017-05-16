/*
JSON-GRAPH SCHEMA AS SPECIFIED HERE: https://github.com/jsongraph/json-graph-specification/blob/master/json-graph-schema.json
Modifications:
  - only one graph instance is allowed
  - all nodes must have a non-empty identifier
  - direction of the graph can be defined (values taken into account are those permitted by dagre for rankDir attribute)
*/
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
        "direction": {
          "type": "string"
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
                "type": "string",
                "minLength": 1
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

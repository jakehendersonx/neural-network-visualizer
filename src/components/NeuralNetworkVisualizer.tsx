"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const calculateAngle = (startX: number, startY: number, endX: number, endY: number) => {
  return Math.atan2(endY - startY, endX - startX);
};

const calculateDistance = (startX: number, startY: number, endX: number, endY: number) => {
  return Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
};

interface NeuralNetworkConfig {
  inputNodes: number;
  hiddenLayers: number[];
  outputNodes: number;
}

const Neuron = ({ x, y }: { x: number; y: number }) => (
  <circle
    cx={x}
    cy={y}
    r={6}
    fill="#E5E7EB"
    stroke="#9CA3AF"
    strokeWidth={1}
  />
)

const Connection = ({ startX, startY, endX, endY }: { startX: number; startY: number; endX: number; endY: number }) => (
  <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#9CA3AF" strokeWidth={1} />
)

const DataFlow = ({ startX, startY, endX, endY, speed }: { startX: number; startY: number; endX: number; endY: number; speed: number }) => {
  const angle = calculateAngle(startX, startY, endX, endY);
  const distance = calculateDistance(startX, startY, endX, endY);

  return (
    <motion.circle
      cx={startX}
      cy={startY}
      r={3}
      fill="#60A5FA"
      initial={{ x: 0, y: 0 }}
      animate={{ 
        x: [0, Math.cos(angle) * distance, 0],
        y: [0, Math.sin(angle) * distance, 0]
      }}
      transition={{ 
        duration: 2 / speed, 
        repeat: Infinity, 
        ease: "linear"
      }}
    />
  );
};

export default function NeuralNetworkVisualizer() {
  const [config, setConfig] = useState<NeuralNetworkConfig>({
    inputNodes: 3,
    hiddenLayers: [4],
    outputNodes: 2
  })
  const [speed, setSpeed] = useState(1)
  const [renderKey, setRenderKey] = useState(0)
  const [hiddenLayersInput, setHiddenLayersInput] = useState("4")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRenderKey(prevKey => prevKey + 1)
  }, [config, speed])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'hiddenLayers') {
      setHiddenLayersInput(value)
      const parsedLayers = value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
      if (parsedLayers.length === 0 && value !== '') {
        setError('Invalid hidden layers input. Please enter comma-separated numbers (e.g., 4,3,2) or leave empty.')
      } else {
        setError(null)
        setConfig(prev => ({ ...prev, hiddenLayers: parsedLayers }))
      }
    } else if (name === 'speed') {
      setSpeed(parseFloat(value))
    } else {
      setConfig(prev => ({ ...prev, [name]: Math.max(parseInt(value) || 1, 1) }))
    }
  }

  const layerDistance = 150
  const neuronDistance = 40
  const layers = [config.inputNodes, ...config.hiddenLayers, config.outputNodes]
  const width = (layers.length - 1) * layerDistance + 100
  const height = Math.max(...layers) * neuronDistance

  const neurons = layers.map((nodeCount, layerIndex) =>
    Array.from({ length: nodeCount }, (_, nodeIndex) => ({
      x: layerIndex * layerDistance + 50,
      y: nodeIndex * neuronDistance + (height - (nodeCount - 1) * neuronDistance) / 2
    }))
  )

  const connections = layers.slice(0, -1).flatMap((_, layerIndex) =>
    neurons[layerIndex].flatMap((startNeuron, startIndex) =>
      neurons[layerIndex + 1].map((endNeuron, endIndex) => ({
        startX: startNeuron.x,
        startY: startNeuron.y,
        endX: endNeuron.x,
        endY: endNeuron.y,
        key: `${layerIndex}-${startIndex}-${endIndex}`
      }))
    )
  )

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center my-8 text-gray-800">Neural Network Visualizer</h1>
      <div className="mb-8 flex flex-wrap justify-center gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="inputNodes" className="text-sm font-medium text-gray-700 mb-1">Input Nodes</label>
          <input
            type="number"
            id="inputNodes"
            name="inputNodes"
            value={config.inputNodes}
            onChange={handleInputChange}
            className="w-20 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="hiddenLayers" className="text-sm font-medium text-gray-700 mb-1">Hidden Layers</label>
          <input
            type="text"
            id="hiddenLayers"
            name="hiddenLayers"
            value={hiddenLayersInput}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 4,3 or empty"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="outputNodes" className="text-sm font-medium text-gray-700 mb-1">Output Nodes</label>
          <input
            type="number"
            id="outputNodes"
            name="outputNodes"
            value={config.outputNodes}
            onChange={handleInputChange}
            className="w-20 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>
        <div className="flex flex-col w-40">
          <label htmlFor="speed" className="text-sm font-medium text-gray-700 mb-1">Animation Speed</label>
          <input
            type="range"
            id="speed"
            name="speed"
            min="0.5"
            max="5"
            step="0.5"
            value={speed}
            onChange={handleInputChange}
            className="w-full"
          />
          <span className="text-sm text-gray-500 mt-1">Speed: {speed.toFixed(1)}x</span>
        </div>
      </div>
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="flex justify-center items-center bg-white rounded-lg shadow-md overflow-x-auto">
            <svg key={renderKey} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {connections.map((conn) => (
                    <Connection key={`conn-${conn.key}`} {...conn} keyProp={`conn-${conn.key}`} />
                ))}
                {neurons.flat().map((neuron, index) => (
                    <Neuron key={`neuron-${index}`} {...neuron} />
                ))}
                {connections.map((conn) => {
                    const { key, ...connProps } = conn;
                    return <DataFlow key={`flow-${key}`} {...connProps} speed={speed} />;
                })}
            </svg>
        </div>
      )}
    </div>
  )
}


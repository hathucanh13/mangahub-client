package utils

import "net"

func GetReplyIP(clientAddr *net.UDPAddr) net.IP {
	conn, err := net.DialUDP("udp", nil, clientAddr)
	if err != nil {
		return nil
	}
	defer conn.Close()

	return conn.LocalAddr().(*net.UDPAddr).IP
}

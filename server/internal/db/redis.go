package db

import (
	"context"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

type Store struct {
	rdb         *redis.Client
	ctx         context.Context
	cacheLock   sync.RWMutex
	memoryCache []byte
	tickerCache []byte
}

func NewStore(addr string) *Store {
	ctx := context.Background()
	rdb := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Warn().Str("addr", addr).Msg("Redis unavailable: using in-memory fallback")
		rdb = nil
	} else {
		log.Info().Str("addr", addr).Msg("Connected to Redis")
	}

	return &Store{
		rdb: rdb,
		ctx: ctx,
	}
}

func (s *Store) SetFeedData(key string, data []byte, expiration time.Duration) {
	s.cacheLock.Lock()
	defer s.cacheLock.Unlock()

	if s.rdb != nil {
		s.rdb.Set(s.ctx, key, data, expiration)
	}
	s.memoryCache = data
}

func (s *Store) GetFeedData(key string) []byte {
	s.cacheLock.RLock()
	defer s.cacheLock.RUnlock()

	if s.rdb != nil {
		data, err := s.rdb.Get(s.ctx, key).Bytes()
		if err == nil {
			return data
		}
	}
	return s.memoryCache
}

func (s *Store) SetTickerData(key string, data []byte, expiration time.Duration) {
	s.cacheLock.Lock()
	defer s.cacheLock.Unlock()

	if s.rdb != nil {
		s.rdb.Set(s.ctx, key, data, expiration)
	}
	s.tickerCache = data
}

func (s *Store) GetTickerData(key string) []byte {
	s.cacheLock.RLock()
	defer s.cacheLock.RUnlock()

	if s.rdb != nil {
		data, err := s.rdb.Get(s.ctx, key).Bytes()
		if err == nil {
			return data
		}
	}
	return s.tickerCache
}

func (s *Store) AddSubscriber(email string) {
	if s.rdb != nil {
		s.rdb.SAdd(s.ctx, "wp:subscribers", email)
	}
}

func (s *Store) GetSubscribers() ([]string, error) {
	if s.rdb != nil {
		return s.rdb.SMembers(s.ctx, "wp:subscribers").Result()
	}
	return nil, nil
}

func (s *Store) TrackUser(ip string) {
	if s.rdb != nil {
		s.rdb.SAdd(s.ctx, "wp:active_users", ip)
		s.rdb.Expire(s.ctx, "wp:active_users", 60*time.Second) 
	}
}

func (s *Store) GetActiveUsersCount() int64 {
	if s.rdb != nil {
		val, _ := s.rdb.SCard(s.ctx, "wp:active_users").Result()
		return val
	}
	return 1
}
